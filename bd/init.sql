-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;  -- Para localização

-- Enums
CREATE TYPE user_role AS ENUM ('family', 'caregiver', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'canceled', 'completed');
CREATE TYPE availability_status AS ENUM ('available', 'booked');
CREATE TYPE request_status AS ENUM ('waiting', 'accepted', 'refused');

-- Schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS family;
CREATE SCHEMA IF NOT EXISTS caregiver;
CREATE SCHEMA IF NOT EXISTS appointments;
CREATE SCHEMA IF NOT EXISTS reviews;
CREATE SCHEMA IF NOT EXISTS knowledge;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AUTH SCHEMA
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL  -- Soft delete
);

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE auth.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    phone VARCHAR(20),
    birthdate DATE,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_user_profiles_timestamp
BEFORE UPDATE ON auth.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE auth.legal_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth.user_terms_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    term_id UUID REFERENCES auth.legal_terms(id),
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAMILY SCHEMA
CREATE TABLE family.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    location GEOGRAPHY(POINT, 4326),  -- PostGIS for distance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_families_timestamp
BEFORE UPDATE ON family.families
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_families_location ON family.families USING GIST(location);

CREATE TABLE family.elders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES family.families(id) ON DELETE CASCADE,
    name VARCHAR(255),
    birthdate DATE,
    medical_conditions JSONB,
    medications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_elders_timestamp
BEFORE UPDATE ON family.elders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE family.ivcf20_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    elder_id UUID REFERENCES family.elders(id) ON DELETE CASCADE,
    answers JSONB,
    score INT,
    result VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_ivcf20_responses_timestamp
BEFORE UPDATE ON family.ivcf20_responses
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- CAREGIVER SCHEMA
CREATE TABLE caregiver.caregivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    crm_coren VARCHAR(50),
    validated BOOLEAN DEFAULT false,
    bio TEXT,
    location GEOGRAPHY(POINT, 4326),  -- PostGIS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_caregivers_timestamp
BEFORE UPDATE ON caregiver.caregivers
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_caregivers_location ON caregiver.caregivers USING GIST(location);
CREATE INDEX idx_caregivers_crm_coren ON caregiver.caregivers(crm_coren);

CREATE TABLE caregiver.caregiver_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_id UUID REFERENCES caregiver.caregivers(id) ON DELETE CASCADE,
    date DATE,
    time_start TIME,
    time_end TIME,
    emergency BOOLEAN DEFAULT false,
    status availability_status DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_caregiver_availability_timestamp
BEFORE UPDATE ON caregiver.caregiver_availability
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE caregiver.caregiver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_id UUID REFERENCES caregiver.caregivers(id) ON DELETE CASCADE,
    file_url TEXT,
    type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APPOINTMENTS SCHEMA
CREATE TABLE appointments.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES family.families(id) ON DELETE SET NULL,
    elder_id UUID REFERENCES family.elders(id) ON DELETE SET NULL,
    caregiver_id UUID REFERENCES caregiver.caregivers(id) ON DELETE SET NULL,
    datetime_start TIMESTAMP NOT NULL,
    datetime_end TIMESTAMP NOT NULL,
    status appointment_status DEFAULT 'pending',
    emergency BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_appointments_timestamp
BEFORE UPDATE ON appointments.appointments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_appointments_status ON appointments.appointments(status);
CREATE INDEX idx_appointments_datetime_start ON appointments.appointments(datetime_start);

CREATE TABLE appointments.appointment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments.appointments(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES caregiver.caregivers(id) ON DELETE CASCADE,
    status request_status DEFAULT 'waiting',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_appointment_requests_timestamp
BEFORE UPDATE ON appointments.appointment_requests
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- REVIEWS SCHEMA
CREATE TABLE reviews.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments.appointments(id) ON DELETE CASCADE,
    family_id UUID REFERENCES family.families(id) ON DELETE SET NULL,
    caregiver_id UUID REFERENCES caregiver.caregivers(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_reviews_timestamp
BEFORE UPDATE ON reviews.reviews
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- KNOWLEDGE SCHEMA
CREATE TABLE knowledge.faq_ai_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_faq_ai_queries_timestamp
BEFORE UPDATE ON knowledge.faq_ai_queries
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_faq_ai_queries_user_id ON knowledge.faq_ai_queries(user_id);