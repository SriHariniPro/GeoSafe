from fastapi import APIRouter
from backend.schemas import SimulationRequest, SimulationResponse
from backend.services.simulation import run_what_if_simulation

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/what-if", response_model=SimulationResponse)
def simulate_what_if_scenario(req: SimulationRequest):
    res = run_what_if_simulation(req.dict())
    return SimulationResponse(**res)
