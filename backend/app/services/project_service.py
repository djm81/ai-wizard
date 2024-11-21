"""project_service module for AI Wizard backend."""

import logging

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.ai_interaction import AIInteraction
from app.models.project import Project
from app.schemas.ai_interaction import AIInteractionCreate
from app.schemas.project import ProjectCreate

logger = logging.getLogger(__name__)


class ProjectService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_user_projects(self, user_id: int) -> list[Project]:
        """Get all projects for a user"""
        return self.db.query(Project).filter(Project.user_id == user_id).all()

    def create_project(self, user_id: int, project: ProjectCreate) -> Project:
        """Create a new project"""
        db_project = Project(user_id=user_id, name=project.name, description=project.description)
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def get_project(self, project_id: int) -> Project:
        """Get a specific project"""
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    def get_project_interactions(self, project_id: int) -> list[AIInteraction]:
        """Get all AI interactions for a project"""
        return self.db.query(AIInteraction).filter(AIInteraction.project_id == project_id).all()

    def create_ai_interaction(
        self, user_id: int, project_id: int, interaction: AIInteractionCreate
    ) -> AIInteraction:
        """Create a new AI interaction for a project"""
        # TODO: Replace with actual AI model response
        placeholder_response = (
            "This is a placeholder response. In the future, this will be replaced "
            "with an actual response from the AI model. Your prompt was: "
            f"'{interaction.prompt}'"
        )

        db_interaction = AIInteraction(
            user_id=user_id,
            project_id=project_id,
            prompt=interaction.prompt,
            response=placeholder_response,
        )
        self.db.add(db_interaction)
        self.db.commit()
        self.db.refresh(db_interaction)
        return db_interaction

    def delete_project(self, project_id: int) -> None:
        """Delete a project and all its associated AI interactions"""
        project = self.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        try:
            # Delete associated AI interactions first
            self.db.query(AIInteraction).filter(AIInteraction.project_id == project_id).delete()
            # Delete the project
            self.db.query(Project).filter(Project.id == project_id).delete()
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete project: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to delete project")

    def get_project_interaction(self, project_id: int, interaction_id: int) -> AIInteraction:
        """Get a specific AI interaction for a project"""
        interaction = (
            self.db.query(AIInteraction)
            .filter(
                AIInteraction.project_id == project_id,
                AIInteraction.id == interaction_id,
            )
            .first()
        )
        if not interaction:
            raise HTTPException(status_code=404, detail="AI Interaction not found")
        return interaction
