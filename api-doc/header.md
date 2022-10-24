<!--
 Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
 Use of this source code is governed by a BSD-style
 license that can be found in the LICENSE file.
-->

# Rédaction d'une API avec le boilerplate @fto-consult/nextjs

Pour générer l'api d'une application nextJS via le boilerplate @fto-consult/nextjs, vous devez :  

1. Dans le fichier package.json situé à la racine de votre projet, ajouter la propriété "apidoc" de type object, ayant les informations tels que définis [sur le site d'apidoc](https://apidocjs.com). ces informations sont de la sorte : 
  {
    "name": "example",
    "version": "0.1.0",
    "description": "apiDoc basic example",
    "title": "Custom apiDoc browser title",
    "url" : "[](https://api.github.com/v1)"
  }
3. Créer un répertoire /api-doc, à la racine de votre projet. dans ledit répertoire, creez :
   1. Un fichier header.md, contenant le texte introductif de la documentation de votre api
   2. Un fichier footer.md, content le texte de conclusion lié à la documentation de votre api
4. Créer un fichier <generate-api-doc.js> contenant l'instruction : require("@fto-consult/next/generate-api-doc")({base:path.resolve(__dirname__)})
5. Créer dans le fichier package.json le script "generate-api-doc" : "node ./generate-api-doc"
6. Enfin, pour Génerer la documentation de l'api, il suffira de faire npm run generate-api-doc.

Pour les instructions, concernant la syntaxe et autres, bien vouloir [consulter le lien](https://apidocjs.com).

# Descriptif de l'API