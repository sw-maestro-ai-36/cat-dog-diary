from fastapi import FastAPI

app = FastAPI(title="냥멍일기 AI Gateway")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
