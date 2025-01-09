# can be used for papi's packs
import os
from shutil import copytree, rmtree
from subprocess import run, DEVNULL, CalledProcessError

try:
    raw_files = f"{os.getcwd()}/raw"
    build_files = f"{os.getcwd()}/files"

    # Remove original files
    rmtree(build_files, ignore_errors=True)

    # Copy the raw files to the build directory
    copytree(raw_files, build_files)

    # Change to the build directory
    os.chdir(f"{build_files}/bp")

    # Do the building
    run("npm install", stdout=DEVNULL, stderr=DEVNULL, shell=True)
    run("npx tsc", stdout=DEVNULL, stderr=DEVNULL, shell=True)
    rmtree("node_modules", ignore_errors=True)
    rmtree("src", ignore_errors=True)
    os.remove("tsconfig.json")
    os.remove("package.json")
    os.remove("package-lock.json")
except FileNotFoundError as e:
    print(f"File not found: {e}")
except Exception as e:
    print(f"An error occurred: {e}")