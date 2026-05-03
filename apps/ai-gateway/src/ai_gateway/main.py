from fastapi import FastAPI

from .contracts import HealthResponse
from .middleware import internal_secret_middleware, jwt_middleware

app = FastAPI(title="냥멍일기 AI Gateway")

# FastAPI middleware 등록 순서: 마지막 add가 가장 outer (request를 먼저 받음).
# 의도 흐름: request → internal_secret → jwt → endpoint.
# 따라서 jwt 먼저(inner), internal_secret 나중에(outer) 등록.
app.middleware("http")(jwt_middleware)
app.middleware("http")(internal_secret_middleware)


@app.get("/health")
def health() -> HealthResponse:
    return HealthResponse()
