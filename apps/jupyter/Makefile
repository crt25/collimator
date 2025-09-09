EXTENSION?='none'
OUTPUT_DIR?=./dist/app
PORT?=8000
BASE_URL?=/jupyter/
JUPYTER_LITE_ARGS?=--piplite-wheels=./dist/otter_grader-6.1.3-py3-none-any.whl --apps=lab --output-dir=$(OUTPUT_DIR) --base-url=$(BASE_URL) --settings-override=./overrides.json --port=$(PORT)

all: init build

init: init-submodules install-deps build-otter init-extensions
	@echo Initialized the jupyterlite project

init-submodules:
	@echo Initializing git submodules for the JupyterLite project
	git submodule update --init --recursive

install-deps:
	@echo Installing Python dependencies for the JupyterLite project
	poetry install

init-extensions:
ifeq ($(OS),Windows_NT)
		poetry run pwsh -Command "cd ./extensions && make init"
else
		poetry run bash -c "cd ./extensions && make init"
endif

build-extensions:
ifeq ($(OS),Windows_NT)
		poetry run pwsh -Command "cd ./extensions && make build"
else
		poetry run bash -c "cd ./extensions && make build"
endif

clean:
	@echo Cleaning the JupyterLite project

# if windows
ifeq ($(OS),Windows_NT)
		@echo Cleaning the JupyterLite project on Windows
		pwsh -Command "if (Test-Path $(OUTPUT_DIR)) { rm -r -fo $(OUTPUT_DIR) }"
		pwsh -Command "if (Test-Path .cache) { rm -r -fo .cache }"
		pwsh -Command "rm .jupyterlite.doit.db"
else
		@echo Cleaning the JupyterLite project on Unix-like systems
		rm -rf $(OUTPUT_DIR)
		rm -rf .cache
		rm .jupyterlite.doit.db
endif

build:
	@echo Building the JupyterLite project

# if cached file and output directory exist, restore the backup file
ifeq ($(OS),Windows_NT)
		pwsh -Command "if ((Test-Path .cache/lab.html) -and (Test-Path $(OUTPUT_DIR)/lab/index.html)) { cp .cache/lab.html $(OUTPUT_DIR)/lab/index.html }"
else
		bash -c "if [ -f .cache/lab.html ] && [ -f $(OUTPUT_DIR)/lab/index.html ]; then cp .cache/lab.html $(OUTPUT_DIR)/lab/index.html; fi"
endif

# run the actual build
	poetry run jupyter lite build $(JUPYTER_LITE_ARGS)

# cache newly built lab index.html file
ifeq ($(OS),Windows_NT)
		pwsh -Command "cp $(OUTPUT_DIR)/lab/index.html .cache/lab.html"
else
		cp $(OUTPUT_DIR)/lab/index.html .cache/lab.html
endif

	@echo Adding iframe-message-buffering.js to index.html
ifeq ($(OS),Windows_NT)
		pwsh -Command "echo '<script>' $$(Get-Content iframe-message-buffering.js) '</script>' | Out-File -Append -FilePath $(OUTPUT_DIR)/lab/index.html -Encoding utf8 -Force"
else
		echo '<script>' >> $(OUTPUT_DIR)/lab/index.html
		cat iframe-message-buffering.js >> $(OUTPUT_DIR)/lab/index.html
		echo '</script>' >> $(OUTPUT_DIR)/lab/index.html
endif

serve:
	@echo Serving the JupyterLite project
	@echo To build the project, run 'make build' first
	poetry run jupyter lite serve $(JUPYTER_LITE_ARGS)

build-otter:
ifeq ($(wildcard otter-grader),)
		@echo The otter-grader directory does not exist. Please initialize the submodules first.
		exit 1
endif

	@echo Building the customized otter grader wheel
	poetry run pip wheel ./otter-grader -w dist --no-deps

ifeq ($(wildcard dist/otter_grader-6.1.3-py3-none-any.whl),)
		@echo The otter grader wheel was not built successfully. Please check the output for errors.
endif

	@echo The otter grader wheel has been built successfully and is located in the 'dist' directory.

.PHONY: all init init-submodules install-deps init-extensions build-extensions clean build serve build-otter
.DEFAULT_GOAL := all