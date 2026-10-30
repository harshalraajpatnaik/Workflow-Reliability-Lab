from setuptools import setup, find_packages

setup(
    name="workflow-reliability-lab",
    version="1.0.0",
    description="Python client SDK for Workflow Reliability Lab",
    author="Workflow Reliability Lab Engineering Team",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0",
    ],
    python_requires=">=3.8",
)
