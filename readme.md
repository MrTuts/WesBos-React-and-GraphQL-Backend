# Notes

- MongoDB is our database
- Database is located in MongoDB Atlas cloud (which uses AWS3 I think)
- We use MongoDB Compass mac app to connect to the database
- KeystoneJS (CMS) is used to create the GraphQL API, viewing schemas, manipulating db data

## 01 - 09

- in frontend project

## 10

- KeystoneJS works with multiple databases, we will be using MongoDB
- installing MongoDB locally <https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/>, but we will be using MongoDB Atlas
- watch video for how to setup the database
- store all config files in `.env` not included in git

## 12

- KeystoneJS runs locally and is configured in `./keystone.ts`

##  13

- data types are defined in `schemas` folder
- field config can have `isIndexed` prop, which should be set to true for fields that we use for search
- schemas are visible in Keystone UI

##  14

- user session is configured using `createAuth` fn, following with setup in `config` using the `ui` and `session` props;

## 16

- `cloudinary.com` for uploading images, it has support by keystone and we can create field to upload image, see `schemas/ProductImage.ts`

##  17

- created relationship between Product (see photo field) and ProductImage (see product field)

## 18

- Seed data by calling script `npm run seed-data`. Seeding is done in `keystone.ts` in config `db-> onConnect`
- We can create seed data in `MongoDB Compass` by exporting the current content in db, eg going into `productImages` table and clicking `export collection` (icon right to the `ADD DATA`) -> `export full collection`.
- I've uploaded the images to my own cloudinary and replaced them in `seed-data/data.ts`. Otherwise original seeded images don't show up in KeystoneJS because they are on wesbos account and that breaks it
