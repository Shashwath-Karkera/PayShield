CREATE TABLE "behavioral_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" varchar(255),
	"event_type" varchar(50) NOT NULL,
	"risk_score" integer NOT NULL,
	"triggered_rules" jsonb,
	"action_taken" varchar(50) NOT NULL,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "behavioral_events" ADD CONSTRAINT "behavioral_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;