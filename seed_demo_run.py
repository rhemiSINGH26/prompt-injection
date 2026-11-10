import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from app.database import SessionLocal, Base, engine
from app.models import Experiment, SystemSettings
from app.datasets.loader import seed_starter_dataset
from app.benchmark.runner import ExperimentRunner

async def main():
    print("Seeding initial benchmark suite and running inaugural demonstration experiment...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Seed dataset
    dataset = seed_starter_dataset(db)
    print(f"Starter dataset seeded with {dataset.total_examples} examples.")

    # 2. Check if an experiment already exists
    existing = db.query(Experiment).first()
    if not existing:
        exp = Experiment(
            name="Inaugural ACIB Benchmark Suite (Demo Run)",
            mode="quick",
            target_provider="mock",
            target_model="gpt-4o-mini",
            red_team_provider="mock",
            red_team_model="gpt-4o",
            language="all",
            attack_type="all",
            defense_config="all",
            max_rounds=3,
            alpha=0.5
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)
        db.close()

        print(f"Executing inaugural demonstration experiment {exp.id}...")
        runner = ExperimentRunner(exp.id)
        await runner.execute()
        print("Inaugural benchmark demonstration run completed successfully!")
    else:
        print("Existing experiments found in database. Ready.")
        db.close()

if __name__ == "__main__":
    asyncio.run(main())

