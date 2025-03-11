import os, traceback, sys
from subprocess import run as sp_run
from importlib import import_module
from typing import Union


def run(cmd: Union[str, list]):
    if isinstance(cmd, list):
        print(f"{Fore.WHITE}> {Fore.LIGHTYELLOW_EX}{' '.join(cmd)}")
    else:
        print(f"{Fore.WHITE}> {Fore.LIGHTYELLOW_EX}{cmd}")
    output = sp_run(cmd, shell=True, capture_output=True, text=True)
    if output.returncode == 0:
        for line in output.stdout.split("\n"):
            print(f"  {line}")
        return output.stdout
    else:
        for line in output.stderr.split("\n"):
            print(f"  {Fore.LIGHTRED_EX}{line}")
        exit(1)

# If I need a module that isn't installed
def check(module, module_name=""):
    try:
        import_module(module)
    except ModuleNotFoundError:
        print(f"{module} is not installed!")
        if module_name == "":
            run([sys.executable, "-m", "pip", "install", module, "--quiet"])
        else:
            run([sys.executable, "-m", "pip", "install", module_name, "--quiet"])

check("colorama")
from colorama import *
init(autoreset=True)

check("ujson")
from ujson import *


# For module to be easy to use and not require
# the start of the program to be cluttered
currentdir = os.getcwd()
if currentdir[-3:] == "pys":
    currentdir = currentdir[:-4]


# Yeah...
def cdir():
    return str(currentdir)


# Clears terminal screen
def clear():
    if os.name == "nt":
        # Windows
        os.system("cls")
    else:
        # Unix, like Mac and Linux
        os.system("clear")


# Simple function to load json from file
def load_json(path):
    with open(path, "r") as file:
        try:
            return loads(file.read())
        except JSONDecodeError:
            print(f"{Fore.RED}\n{path} got a JSON Decode Error")
            print(f"{Fore.RED}{traceback.format_exc()}")
            exit()


# Simple function to save json into file
def dump_json(path, dictionary):
    the_json = dumps(dictionary, indent=2)
    the_json = the_json.replace(r"\/","/")
    with open(path, "w") as file:
        file.write(the_json)
