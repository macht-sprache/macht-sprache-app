#!/bin/zsh

emulate -LR zsh

CLOUD_STORAGE_BUCKET="macht-sprache-firestore-backups"

localDbPath="./local-db"
localFirestorePath="$localDbPath/firestore_export"

if [[ ! -f $localDbPath/firebase-export-metadata.json ]]
then
    echo "No local db found. Run the emulator first and set up a local account, then quit the emulator to run an export."
    exit 1
fi

backups=$(gsutil ls gs://$CLOUD_STORAGE_BUCKET)
backupList=( ${(f)backups} )
lastBackup=$backupList[-1]

if [[ -z $lastBackup ]]
then
    echo "No backup found."
    exit 1
fi

read -s -q "REPLY?Before downloading a backup you should set up a local account with a user name matching your production account. This will also delete your current local db. Continue?"
echo ""

if [[ ! $REPLY = y ]]
then
    exit 1
fi

echo "Clearing local db..."
rm -r $localFirestorePath/**

echo "Downloading backup from $lastBackup"
gsutil -m cp -r "$lastBackup"all_namespaces $localFirestorePath/
gsutil cp "$lastBackup""*.overall_export_metadata" $localFirestorePath/firestore_export.overall_export_metadata
echo ""
echo "Backup download successful. To connect your local account to your production account change its ID in $localDbPath/auth_export/accounts.json."

