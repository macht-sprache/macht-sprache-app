import { functions, logger } from '../firebase';
import firestore from '@google-cloud/firestore';
import config from '../config';

const client = new firestore.v1.FirestoreAdminClient();

export const dailyFirestoreBackup = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    const [response] = await client.exportDocuments({
        name: client.databasePath((process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT)!, '(default)'),
        outputUriPrefix: config.backup.bucket,
    });
    logger.info(`Finished Backup. Operation Name: ${response.name}`);
});
