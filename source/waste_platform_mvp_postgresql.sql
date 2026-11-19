-- Waste Exchange & Environmental Mapping Platform
-- PostgreSQL MVP schema
-- Compatible with PostgreSQL 14+
-- Run this file against an empty database.

BEGIN;

-- 1. ENUM TYPES

CREATE TYPE user_account_type AS ENUM (
    'INDIVIDUAL',
    'JUNK_SHOP',
    'ORGANISATION',
    'BUSINESS'
);

CREATE TYPE system_role AS ENUM (
    'USER',
    'ADMIN'
);

CREATE TYPE contact_type AS ENUM (
    'TELEGRAM',
    'PHONE',
    'EMAIL'
);

CREATE TYPE listing_type AS ENUM (
    'FOR_SALE',
    'FREE',
    'WANTED'
);

CREATE TYPE listing_status AS ENUM (
    'ACTIVE',
    'PAUSED',
    'RESERVED',
    'COMPLETED',
    'CLOSED'
);

CREATE TYPE quantity_unit AS ENUM (
    'KG',
    'GRAM',
    'TON',
    'PIECE',
    'BAG',
    'BUNDLE',
    'LITRE',
    'OTHER'
);

CREATE TYPE material_request_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED'
);

CREATE TYPE waste_report_status AS ENUM (
    'REPORTED',
    'VERIFIED',
    'COLLECTED',
    'RESOLVED'
);

CREATE TYPE suggestion_method AS ENUM (
    'REUSE',
    'RECYCLE'
);


-- 2. USERS

CREATE TABLE users (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    account_type        user_account_type NOT NULL DEFAULT 'INDIVIDUAL',
    system_role         system_role NOT NULL DEFAULT 'USER',
    profile_image_url   TEXT,
    bio                 TEXT,
    city                VARCHAR(100),
    township            VARCHAR(100),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contact values are private. Do not expose these through public profile APIs.
-- The application should reveal the relevant contacts only after a request is ACCEPTED.
CREATE TABLE user_contacts (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_type        contact_type NOT NULL,
    contact_value       VARCHAR(255) NOT NULL,
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_contact UNIQUE (user_id, contact_type, contact_value)
);

CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);


-- 3. MATERIAL CATEGORIES

CREATE TABLE material_categories (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 4. MATERIAL LISTINGS
-- FOR_SALE: owner is selling material; price is required.
-- FREE: owner is giving material away; price must be zero or NULL.
-- WANTED: owner is looking for material; price is not used.

CREATE TABLE material_listings (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id         BIGINT NOT NULL REFERENCES material_categories(id) ON DELETE RESTRICT,
    listing_type        listing_type NOT NULL,
    title               VARCHAR(180) NOT NULL,
    description         TEXT,
    quantity            NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    quantity_unit       quantity_unit NOT NULL DEFAULT 'KG',
    price_per_unit      NUMERIC(12, 2),
    currency            CHAR(3) NOT NULL DEFAULT 'MMK',
    city                VARCHAR(100) NOT NULL,
    township            VARCHAR(100),
    address_description TEXT,
    latitude            NUMERIC(10, 7),
    longitude           NUMERIC(10, 7),
    status              listing_status NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_listing_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    ),
    CONSTRAINT chk_listing_price CHECK (
        (listing_type = 'FOR_SALE' AND price_per_unit IS NOT NULL AND price_per_unit >= 0)
        OR
        (listing_type IN ('FREE', 'WANTED') AND price_per_unit IS NULL)
    )
);

CREATE INDEX idx_listings_user_id ON material_listings(user_id);
CREATE INDEX idx_listings_category_id ON material_listings(category_id);
CREATE INDEX idx_listings_type_status ON material_listings(listing_type, status);
CREATE INDEX idx_listings_location ON material_listings(city, township);


-- 5. LISTING IMAGES

CREATE TABLE listing_images (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id          BIGINT NOT NULL REFERENCES material_listings(id) ON DELETE CASCADE,
    image_url           TEXT NOT NULL,
    display_order       SMALLINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);


-- 6. MARKETPLACE REQUESTS
-- For FOR_SALE/FREE listings, requester_id is usually the buyer/receiver.
-- For WANTED listings, requester_id is the person offering the requested material.
-- The listing owner accepts or rejects the request.
-- Both parties may see each other's contact details only when status = ACCEPTED
-- (or COMPLETED, for access to the transaction history).

CREATE TABLE material_requests (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id          BIGINT NOT NULL REFERENCES material_listings(id) ON DELETE RESTRICT,
    requester_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message             TEXT,
    requested_quantity  NUMERIC(12, 3) NOT NULL CHECK (requested_quantity > 0),
    status              material_request_status NOT NULL DEFAULT 'PENDING',
    responded_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prevent duplicate pending requests while allowing a user to try again
-- after an earlier request has been rejected or cancelled.
CREATE UNIQUE INDEX uq_pending_listing_requester
ON material_requests(listing_id, requester_id)
WHERE status = 'PENDING';

CREATE INDEX idx_material_requests_listing_id ON material_requests(listing_id);
CREATE INDEX idx_material_requests_requester_id ON material_requests(requester_id);
CREATE INDEX idx_material_requests_status ON material_requests(status);


-- 7. WASTE MAP REPORTS
-- reported_by identifies the user who submitted the report.

CREATE TABLE waste_reports (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reported_by         BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id         BIGINT NOT NULL REFERENCES material_categories(id) ON DELETE RESTRICT,
    title               VARCHAR(180) NOT NULL,
    description         TEXT,
    estimated_quantity  NUMERIC(12, 3),
    quantity_unit       quantity_unit,
    city                VARCHAR(100) NOT NULL,
    township            VARCHAR(100),
    address_description TEXT,
    latitude            NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude           NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    status              waste_report_status NOT NULL DEFAULT 'REPORTED',
    reported_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_report_quantity CHECK (
        estimated_quantity IS NULL OR estimated_quantity > 0
    )
);

CREATE INDEX idx_waste_reports_reported_by ON waste_reports(reported_by);
CREATE INDEX idx_waste_reports_category_id ON waste_reports(category_id);
CREATE INDEX idx_waste_reports_status ON waste_reports(status);
CREATE INDEX idx_waste_reports_location ON waste_reports(city, township);


-- 8. WASTE REPORT IMAGES

CREATE TABLE waste_report_images (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    waste_report_id     BIGINT NOT NULL REFERENCES waste_reports(id) ON DELETE CASCADE,
    image_url           TEXT NOT NULL,
    display_order       SMALLINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_waste_report_images_report_id ON waste_report_images(waste_report_id);


-- 9. REUSE & RECYCLING SUGGESTIONS
-- Suggestions are prepared by the platform/admin and linked to a material category.

CREATE TABLE reuse_suggestions (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id         BIGINT NOT NULL REFERENCES material_categories(id) ON DELETE RESTRICT,
    title               VARCHAR(180) NOT NULL,
    description         TEXT NOT NULL,
    method              suggestion_method NOT NULL,
    instructions        TEXT,
    difficulty          VARCHAR(30),
    safety_notes        TEXT,
    image_url           TEXT,
    is_published        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reuse_suggestions_category_id ON reuse_suggestions(category_id);
CREATE INDEX idx_reuse_suggestions_published ON reuse_suggestions(is_published);


-- 10. BASIC UPDATED_AT TRIGGER

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_material_listings_updated_at
BEFORE UPDATE ON material_listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_material_requests_updated_at
BEFORE UPDATE ON material_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_waste_reports_updated_at
BEFORE UPDATE ON waste_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reuse_suggestions_updated_at
BEFORE UPDATE ON reuse_suggestions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


COMMIT;

-- IMPORTANT APPLICATION RULES:
-- 1. Never return user_contacts in public user/profile/listing responses.
-- 2. Return contact details only if the logged-in user is either:
--    a) the listing owner, or
--    b) the requester,
--    AND the related material_requests.status is ACCEPTED or COMPLETED.
-- 3. Only the listing owner may ACCEPT or REJECT a request.
-- 4. A user cannot request their own listing.
-- 5. For a WANTED listing, the requester is the person offering the material.
-- 6. Do not hard-delete users who have listings, requests or reports; deactivate them.
-- 7. Store uploaded image files in object storage; save only their URLs in these tables.
