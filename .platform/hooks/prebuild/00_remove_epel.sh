#!/bin/bash
# Remove EPEL repo if it was added by a previous deployment.
# This prevents yum makecache from hanging on EPEL metadata downloads.
set -euo pipefail

if yum repolist enabled 2>/dev/null | grep -qi "epel"; then
  echo "Removing EPEL repository..."
  yum-config-manager --disable epel 2>/dev/null || true
  rm -f /etc/yum.repos.d/epel*.repo 2>/dev/null || true
  yum clean all
  echo "EPEL removed."
else
  echo "EPEL not found, nothing to do."
fi
