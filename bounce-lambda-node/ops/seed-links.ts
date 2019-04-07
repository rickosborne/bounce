import console from 'console';
import mysql from 'mysql';
import process from 'process';
import {BounceLink} from "../api/BounceLink";
import {BounceDynamoStore} from '../impl/BounceDynamoStore';
import {ClockDateTimeProvider} from '../impl/ClockDateTimeProvider';

function req(name: string): string {
  const value = process.env[name];
  if (value == null || value === '') {
    throw new Error(`Missing required ${name}`);
  }
  return value;
}

const MYSQL_HOST = req('MYSQL_HOST');
const MYSQL_PORT = parseInt(req('MYSQL_PORT'), 10);
const MYSQL_USER = req('MYSQL_USER');
const MYSQL_PASS = req('MYSQL_PASS');
const MYSQL_SCHEMA = req('MYSQL_SCHEMA');
const AWS_REGION = req('AWS_REGION');
const AWS_ACCESS_KEY = req('AWS_ACCESS_KEY');
const AWS_ACCESS_SECRET = req('AWS_ACCESS_SECRET');

const connection = mysql.createConnection({
  database: MYSQL_SCHEMA,
  host: MYSQL_HOST,
  password: MYSQL_PASS,
  port: MYSQL_PORT,
  user: MYSQL_USER,
});

interface LinkRow {
  link_created: Date;
  link_hits: number;
  link_id: number;
  link_name: string;
  link_peeks: number;
  link_title: string;
  link_to: string;
}

const dynamoStore = new BounceDynamoStore(
  {
    awsAccessKey: AWS_ACCESS_KEY,
    awsAccessSecret: AWS_ACCESS_SECRET,
    region: AWS_REGION,
    type: "dynamo",
  },
  console,
  new ClockDateTimeProvider(),
);

connection.connect((connectError) => {
  if (connectError) {
    throw new Error(`Could not connect: ${JSON.stringify(connectError)}`);
  }
});

connection.query(`
      SELECT link_id, link_name, link_created, link_hits, link_peeks, link_to, link_title
      FROM bounce_link
      ORDER BY link_id
  `, [], (queryError, results) => {
  if (queryError) {
    throw new Error(`Could not fetch links: ${JSON.stringify(queryError)}`);
  }
  if (!Array.isArray(results)) {
    throw new Error(`Expected an array: ${JSON.stringify(results)}`);
  }
  results.forEach((row: LinkRow) => dynamoStore
    .linkFromName(row.link_name)
    .then((maybeLink: BounceLink | null) => {
      if (maybeLink == null) {
        const link: BounceLink = {
          created: row.link_created,
          hits: row.link_hits,
          href: row.link_to,
          id: String(row.link_id),
          name: row.link_name,
          peeks: row.link_peeks,
          title: row.link_title,
        };
        console.log(`Creating: ${JSON.stringify(link)}`);
        dynamoStore.createLink(link).catch((reason: any) => {
          throw new Error(`Could not save link ${JSON.stringify(row)}: ${JSON.stringify(reason)}`);
        });
      }
    })
    .catch((reason) => {
      throw new Error(`Could not query for link: ${JSON.stringify(reason)}`);
    }),
  );
});
