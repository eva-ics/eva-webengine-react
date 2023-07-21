all:
	npm run build

bump:
	npm version --no-git-tag-version patch

pub:
	rci x eva.webengine-react
