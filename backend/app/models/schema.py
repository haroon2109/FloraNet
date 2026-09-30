from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry
import datetime

Base = declarative_base()

class Farm(Base):
    __tablename__ = 'farms'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    farmer_id = Column(String, index=True)
    location = Column(Geometry('POLYGON'))
    crop_type = Column(String)

class SoilData(Base):
    __tablename__ = 'soil_data'
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    nitrogen = Column(Float)
    phosphorus = Column(Float)
    potassium = Column(Float)
    moisture = Column(Float)

class AdvisoryLog(Base):
    __tablename__ = 'advisory_logs'
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    query_text = Column(String)
    response_text = Column(String)
    audio_url = Column(String, nullable=True)
