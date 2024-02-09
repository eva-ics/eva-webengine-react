all:
	npm run build

bump:
	npm version --no-git-tag-version patch
	sed -i "s/\(const eva_webengine_react_version\).*/\1 = \"`jq < package.json -r .version`\";/g" ./src/common.ts

pub: build-pub doc

build-pub:
	rci x eva.webengine-react

doc:
	rm -rf docs
	typedoc
	cd docs && gsutil -m cp -a public-read -r . gs://pub.bma.ai/dev/docs/eva-webengine-react/
