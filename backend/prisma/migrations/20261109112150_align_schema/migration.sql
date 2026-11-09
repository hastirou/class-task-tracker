-- RenameEnum (preserves existing data)
ALTER TYPE "user_role" RENAME TO "UserRole";

-- AlterTable (safe on non-empty table: backfill via DEFAULT)
ALTER TABLE "users" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_id_fkey";

-- AddForeignKey (schema now requires CASCADE)
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
