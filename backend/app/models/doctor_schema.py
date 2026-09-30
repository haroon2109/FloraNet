from pydantic import BaseModel, Field
from typing import List, Optional

class Remedy(BaseModel):
    name: str = Field(description="Name of the remedy or intervention")
    description: str = Field(description="Detailed instructions on how to apply or use the remedy")
    type: str = Field(description="Type of remedy, e.g., 'organic', 'chemical', 'cultural'")

class DiagnosisResponse(BaseModel):
    disease_identification: str = Field(description="The name of the identified disease, pest, or condition")
    confidence_score: float = Field(description="Confidence score of the diagnosis from 0.0 to 1.0")
    organic_remedies: List[Remedy] = Field(description="List of organic or regenerative remedies")
    chemical_alternatives: Optional[List[Remedy]] = Field(description="List of chemical alternatives if the condition is severe")
    additional_notes: Optional[str] = Field(description="Any other agronomic advice based on location or soil data context")
