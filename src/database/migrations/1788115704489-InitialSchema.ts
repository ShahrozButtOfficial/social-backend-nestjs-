import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788115704489 implements MigrationInterface {
    name = 'InitialSchema1788115704489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_DELETED', 'POST_DELETED', 'COMMENT_DELETED', 'COMMENT_DELETE_APPROVED', 'COMMENT_DELETE_REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_entitytype_enum" AS ENUM('USER', 'POST', 'COMMENT', 'COMMENT_DELETION_REQUEST')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminId" uuid NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL, "entityType" "public"."audit_logs_entitytype_enum" NOT NULL, "entityId" uuid NOT NULL, "reason" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_13c69424c440a0e765053feb4b" ON "audit_logs"  ("entityType", "entityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_01819a7b970174c1316f32a2c2" ON "audit_logs"  ("adminId", "createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."comment_deletion_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "comment_deletion_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "commentId" uuid NOT NULL, "requestedBy" uuid NOT NULL, "reviewedBy" uuid, "status" "public"."comment_deletion_requests_status_enum" NOT NULL DEFAULT 'PENDING', "reason" text, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55f69d35ce649a67be552c3b8e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c847eb30deafa98daae9a7b13b" ON "comment_deletion_requests"  ("commentId", "status") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('POST_DELETED', 'COMMENT_DELETED', 'ACCOUNT_DEACTIVATED', 'ACCOUNT_ACTIVATED', 'COMMENT_DELETE_APPROVED', 'COMMENT_DELETE_REJECTED')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications"  ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications"  ("userId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "comment_deletion_requests" ADD CONSTRAINT "FK_588960244d46ddf079ed8f699f2" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_deletion_requests" ADD CONSTRAINT "FK_523db735cbd557111d02c1292f3" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_deletion_requests" DROP CONSTRAINT "FK_523db735cbd557111d02c1292f3"`);
        await queryRunner.query(`ALTER TABLE "comment_deletion_requests" DROP CONSTRAINT "FK_588960244d46ddf079ed8f699f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c847eb30deafa98daae9a7b13b"`);
        await queryRunner.query(`DROP TABLE "comment_deletion_requests"`);
        await queryRunner.query(`DROP TYPE "public"."comment_deletion_requests_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_01819a7b970174c1316f32a2c2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13c69424c440a0e765053feb4b"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_entitytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    }

}
