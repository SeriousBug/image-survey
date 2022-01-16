#!/bin/bash
# Trap errors and interrupts
set -Eeuo pipefail
function handle_sigint() {
  echo "SIGINT, exiting..."
  exit 1
}
trap handle_sigint SIGINT
function handle_err() {
  echo "Error in run.sh!" 1>&2
  echo "$(caller): ${BASH_COMMAND}" 1>&2
  echo "Exiting..."
  exit 2
}
trap handle_err ERR

# Go to the root of the project
SCRIPT=$(realpath "${0}")
SCRIPTPATH=$(dirname "${SCRIPT}")
cd "${SCRIPTPATH}/.." || exit 12

CHECK=
if [[ $# -gt 1 && "$1" = "--check" ]]; then
  CHECK="--check"
fi

echo "${CHECK}"

cd ui
yarn eslint src/
