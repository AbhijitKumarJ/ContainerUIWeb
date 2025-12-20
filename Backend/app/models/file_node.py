from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class FileNode(BaseModel):
    name: str
    type: Literal["file", "folder"]
    size: Optional[int] = None
    modified: Optional[datetime] = None
