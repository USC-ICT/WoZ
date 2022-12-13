#! /bin/bash -e

dir_name=$(dirname "${0}")
pushd "${dir_name}"
this_dir=$(pwd -L)
# Use "pwd -P" for the path without links. man bash for more info.
popd
ROOT_DIR="${this_dir}"

MOUNT_DIR="/tmp/RemoteWoZ"
RELEASE_DIR_NAME="dist/woz"
SERVER_APP_DIR_NAME="woz"

RELEASE_DIR_PATH="${ROOT_DIR}/${RELEASE_DIR_NAME}"

mkdir -p "${MOUNT_DIR}"

server="tegileshare.ict.usc.edu"

user_name=$(security find-internet-password -s "${server}" \
  | grep \"acct\" | sed -E 's/.*"acct"<blob>="//g' | sed -E 's/"$//g')

password=$(security find-internet-password -s "${server}" -w)

/sbin/mount -t smbfs "smb://${user_name}:${password}@${server}/projects/nld" "${MOUNT_DIR}"
MOUNT_RESULT=$?

if [ $MOUNT_RESULT -eq 0 ]
then
  rsync -rlptvC \
    --chmod=ugo+r,Dugo+x \
    --delete \
    --exclude .DS_Store \
    --modify-window 1 \
  "${RELEASE_DIR_PATH}/" "${MOUNT_DIR}/${SERVER_APP_DIR_NAME}/"

  /sbin/umount -f "${MOUNT_DIR}"
fi

rmdir "${MOUNT_DIR}"
