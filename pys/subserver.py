from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from uuid import uuid4
from rich.console import Console
from custom_functions import *
from types import SimpleNamespace

os.chdir(cdir())

console = Console()
print = console.log

app = FastAPI()

sendToCF(SimpleNamespace(quiet=False, dev=True))

print("[green]Building client resources")
run("python pys/pre_commit.py --no-stash --build server --format", quiet=True)
print("[green]Server resources prebuilt")

app.mount("/", StaticFiles(directory=f"{cdir()}/build", html=True), name="static")

@app.get("/{file_path:path}")
async def get_file_path(file_path: str, request: Request):
    file_location = os.path.join(cdir(), "build", file_path)
    print(f"Requested file location: {file_location}")
    return FileResponse(file_location)