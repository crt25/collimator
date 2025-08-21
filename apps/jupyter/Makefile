EXTENSION?='none'
WINDOWS_PYENV?=.\pyenv\Scripts\Activate.ps1
LINUX_PYENV?=source pyenv/bin/activate
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
	pip install 'jupyterlite-core' 'jupyterlite-pyodide-kernel' 'jupyterlab' 'jupyterlab_server' libarchive-c 'copier' jinja2-time

init-extensions:
	cd ./extensions/notebook-runner && jlpm prepare
	cd ./extensions/notebook-runner && pip install -e "."
	cd ./extensions/notebook-runner && jupyter labextension develop . --overwrite

build-extensions:
	cd ./extensions/notebook-runner && jlpm build

clean:
	@echo Cleaning the JupyterLite project

# if windows
ifeq ($(OS),Windows_NT)
		@echo Cleaning the JupyterLite project on Windows
		pwsh -Command "if (Test-Path $(OUTPUT_DIR)) { rm -r -fo $(OUTPUT_DIR) }"
		pwsh -Command "if (Test-Path .cache) { rm -r -fo .cache }"
		rm .jupyterlite.doit.db
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
	jupyter lite build $(JUPYTER_LITE_ARGS)

# cache newly built lab index.html file
ifeq ($(OS),Windows_NT)
		pwsh -Command "cp $(OUTPUT_DIR)/lab/index.html .cache/lab.html"
else
		cp $(OUTPUT_DIR)/lab/index.html .cache/lab.html
endif

	@echo Adding iframe-message-buffering.js to index.html
ifeq ($(OS),Windows_NT)
		pwsh -Command "echo '<script>' | Out-File -Append -FilePath $(OUTPUT_DIR)/lab/index.html -Encoding utf8 -Force"
		pwsh -Command "Get-Content iframe-message-buffering.js | Out-File -Append -FilePath $(OUTPUT_DIR)/lab/index.html -Encoding utf8 -Force"
		pwsh -Command "echo '</script>' | Out-File -Append -FilePath $(OUTPUT_DIR)/lab/index.html -Encoding utf8 -Force"
else
		echo '<script>' >> $(OUTPUT_DIR)/lab/index.html
		cat iframe-message-buffering.js >> $(OUTPUT_DIR)/lab/index.html
		echo '</script>' >> $(OUTPUT_DIR)/lab/index.html
endif

serve:
	@echo Serving the JupyterLite project
	@echo To build the project, run 'make build' first
	jupyter lite serve $(JUPYTER_LITE_ARGS)

create-env:
	@echo Creating a Python virtual environment in ./pyenv

ifeq ($(wildcard pyenv),)
ifeq ($(OS),Windows_NT)
			@echo To activate the virtual environment, run:
			@echo $(WINDOWS_PYENV)
else
			@echo To activate the virtual environment, run:
			@echo $(LINUX_PYENV)
endif

		python -m venv ./pyenv
else
		@echo Virtual environment already exists. If you want to recreate it, please delete the 'pyenv' directory first.
endif

activate-env:
	@echo Activating the Python virtual environment
ifeq ($(OS),Windows_NT)
		@echo Run $(WINDOWS_PYENV)
		exit 1
else
		$(LINUX_PYENV)
endif

build-otter:
ifeq ($(wildcard otter-grader),)
		@echo The otter-grader directory does not exist. Please initialize the submodules first.
		exit 1
endif

	@echo Building the customized otter grader wheel
ifeq ($(OS),Windows_NT)
		pwsh -NoProfile -ExecutionPolicy Bypass -Command ". $(WINDOWS_PYENV); pip wheel ./otter-grader -w dist --no-deps"
else
		$(LINUX_PYENV)
		pip wheel otter-grader -w dist --no-deps
endif

ifeq ($(wildcard dist/otter_grader-6.1.3-py3-none-any.whl),)
		@echo The otter grader wheel was not built successfully. Please check the output for errors.
endif

	@echo The otter grader wheel has been built successfully and is located in the 'dist' directory.

create-extension:
ifeq ($(EXTENSION), 'none')
		@echo Please set the EXTENSION variable to the name of the extension you want to create.
		@echo Example: make create-extension EXTENSION='path/to/my/extension'
		exit 1
endif

	mkdir -p $(EXTENSION)
	cd $(EXTENSION) && copier copy --trust https://github.com/jupyterlab/extension-template .

install-extension-deps:
ifeq ($(EXTENSION), 'none')
		@echo Please set the EXTENSION variable to the name of the extension you want to install dependencies for.
		@echo Example: make install-extension-deps EXTENSION='path/to/my/extension'
		exit 1
endif
	cd $(EXTENSION)
	pip install -ve .

link-extension:
ifeq ($(EXTENSION), 'none')
		@echo Please set the EXTENSION variable to the name of the extension you want to link.
		@echo Example: make link-extension EXTENSION='path/to/my/extension'
		exit 1
endif
	cd $(EXTENSION)
	jupyter labextension link .

.PHONY: all init init-submodules install-deps init-extensions build-extensions clean build serve create-env activate-env build-otter create-extension install-extension-deps link-extension
.DEFAULT_GOAL := all