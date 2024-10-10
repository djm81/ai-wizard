from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.project import Project
from app.models.ai_interaction import AIInteraction
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.ai_interaction import AIInteractionCreate

class ProjectService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_project(self, user_id: int, project: ProjectCreate) -> Project:
        db_project = Project(**project.dict(), user_id=user_id)
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def get_project(self, project_id: int) -> Project:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_user_projects(self, user_id: int) -> list[Project]:
        return self.db.query(Project).filter(Project.user_id == user_id).all()

    def update_project(self, project_id: int, project: ProjectUpdate) -> Project:
        db_project = self.get_project(project_id)
        if db_project:
            update_data = project.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_project, key, value)
            self.db.commit()
            self.db.refresh(db_project)
        return db_project

    def delete_project(self, project_id: int) -> bool:
        db_project = self.get_project(project_id)
        if db_project:
            self.db.delete(db_project)
            self.db.commit()
            return True
        return False

    def create_ai_interaction(self, user_id: int, project_id: int, interaction: AIInteractionCreate) -> AIInteraction:
        db_interaction = AIInteraction(**interaction.dict(), user_id=user_id, project_id=project_id)
        self.db.add(db_interaction)
        self.db.commit()
        self.db.refresh(db_interaction)
        return db_interaction

    def get_project_interactions(self, project_id: int) -> list[AIInteraction]:
        return self.db.query(AIInteraction).filter(AIInteraction.project_id == project_id).all()