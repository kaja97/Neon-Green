from enum import Enum
from pydantic import BaseModel, Field

class AccountRole(str, Enum):
    FARMER = "farmer"
    ADMIN = "admin"
    VENDOR = "vendor"
    BUYER = "buyer"

class AdminRoleUpdate(BaseModel):
    role: AccountRole = Field(..., description="The new role to assign to the user")
