-- Enforce the 1-5 rating bound at the database level, not just in application code.
-- Prisma's schema language has no CHECK-constraint attribute, so this is added as raw SQL.
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);
