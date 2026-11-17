from fastapi import APIRouter, HTTPException, Depends
from ..ml.predictor import predict, is_loaded
from ..schemas.ml import PredictRequest, PredictResponse
from ..routers.auth import get_current_user_id

router = APIRouter(prefix="/ml", tags=["ml"])


@router.get("/status")
def status():
    return {"model_loaded": is_loaded()}


@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(payload: PredictRequest, user_id: str = Depends(get_current_user_id)):
    try:
        result = predict(payload.model_dump(exclude={"model"}), payload.model or "random_forest")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result
