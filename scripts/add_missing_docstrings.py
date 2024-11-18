"""add_missing_docstrings module for AI Wizard backend."""

#!/usr/bin/env python
import ast
import sys
from pathlib import Path


def add_module_docstring(filename: str) -> None:
    """Add missing module docstring to Python file."""
    with open(filename, "r") as f:
        content = f.read()

    tree = ast.parse(content)
    if not ast.get_docstring(tree):
        module_name = Path(filename).stem
        docstring = f'"""{module_name} module for AI Wizard backend."""\n\n'
        with open(filename, "w") as f:
            f.write(docstring + content)


if __name__ == "__main__":
    for filename in sys.argv[1:]:
        add_module_docstring(filename)
