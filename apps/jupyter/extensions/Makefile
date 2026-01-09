EXTENSION?='none'

init:
	cd ./notebook-runner && node scripts/create-symlink.js
	cd ./notebook-runner && node scripts/create-version.js
	cd ./notebook-runner && pip install -e "."
	cd ./notebook-runner && jupyter labextension develop . --overwrite
	cd ./notebook-runner && jupyter labextension link .

build:
	cd ./notebook-runner && jlpm build

link:
	cd ./notebook-runner && jupyter labextension develop . --overwrite
	cd ./notebook-runner && jupyter labextension link .

test: 
	cd ./notebook-runner && jlpm test

create-extension:
ifeq ($(EXTENSION), 'none')
		@echo Please set the EXTENSION variable to the name of the extension you want to create.
		@echo Example: make create-extension EXTENSION='my-extension'
		exit 1
endif

	mkdir -p $(EXTENSION)
	cd $(EXTENSION) && copier copy --trust https://github.com/jupyterlab/extension-template .

install-extension-deps:
ifeq ($(EXTENSION), 'none')
		@echo Please set the EXTENSION variable to the name of the extension you want to install dependencies for.
		@echo Example: make install-extension-deps EXTENSION='my-extension'
		exit 1
endif
	cd $(EXTENSION)
	pip install -ve .

link-extension:
ifeq ($(EXTENSION), 'none')
		@echo Please set the EXTENSION variable to the name of the extension you want to link.
		@echo Example: make link-extension EXTENSION='my-extension'
		exit 1
endif
	cd $(EXTENSION)
	jupyter labextension develop . --overwrite

upload-sourcemaps:
	@echo Uploading sourcemaps to Sentry
	cd ./notebook-runner && jlpm sentry:sourcemaps

.PHONY: init build link test create-extension install-extension-deps link-extension  upload-sourcemaps
.DEFAULT_GOAL := build