#YoImages Search

YoImages Search is a Wordpress plugin that allows searching and uploading royalty free photos from the web directly into the Wordpress Admin interface.

YoImages Search is part of a suite of modules which aim is to add better image handling capabilities to the Wordpress core, read more about [YoImages Search](https://github.com/sirulli/yoimages#image-search "").

You can get YoImages Search along with other YoImages modules [here](https://github.com/sirulli/yoimages "") or you can install it as a stand alone Wordpress plugin following the steps described in the next paragraph.

##Install YoImages Search from sources

YoImages Search is built with [Composer](https://getcomposer.org/ "").
To install it from sources go to your Wordpress plugin directory via terminal and there:

```sh

git clone https://github.com/sirulli/yoimages-search.git
cd yoimages-search
curl -sS https://getcomposer.org/installer | php
php composer.phar install

```


To update your installed YoImages Search plugin from sources go to Wordpress plugin directory via terminal and there: 

```sh

cd yoimages-search
git pull
php composer.phar update

```


