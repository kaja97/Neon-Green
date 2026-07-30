import logging
from typing import Optional

class BaseService:
    """
    Base service class that all module services should inherit from.
    Provides a standardized logger for the service.
    """
    
    def __init__(self):
        # Set up a logger specific to the child class name
        self.logger = logging.getLogger(f"agrifarm.services.{self.__class__.__name__}")
