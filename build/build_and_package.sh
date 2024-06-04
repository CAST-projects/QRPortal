
#
#
#  build_and_package.sh -w $workspace -b 1000 -s Sources -z upload
#
#
# set -x

display_usage()
{
    echo "usage:"
    echo "$0"
    echo
    echo "%0 -w <path> -s <path> -z <path> -b <number>"
    echo
    echo "-w: workspace: full path to the workspace dir"
    echo "-s: sources directory full path"
    echo "-z: output directory full path"
    echo "-b: build number: build number for this package"
}

unset BUILDNO
unset OUTDIR
unset SRCDIR
unset WORKSPACE
MODE=normal
while getopts "w:b:s:z:m:l:u:a:" OPT; do
   case $OPT in
      b) BUILDNO=${OPTARG};;
      w) WORKSPACE=${OPTARG};;
      s) SRCDIR=${OPTARG};;
      z) OUTDIR=${OPTARG};;
      m) MODE=${OPTARG};;
      /?) display_usage ; exit 1;;
   esac
done
[ -z "$BUILDNO" ] && display_usage && exit 1
[ -z "$OUTDIR" ] && display_usage && exit 1
[ -z "$SRCDIR" ] && display_usage && exit 1
[ -z "$WORKSPACE" ] && display_usage && exit 1

CMDDIR=`dirname $0`

USER="technologies"
TEST_SRVHOST="jnk_test_servers"
TEST_SRVPORT=8085

SRVPACKSDIR="packages"
SSH_OPTS="-o StrictHostKeyChecking=no"
TEMPDIR=$WORKSPACE/temp
TMPFIC=$TEMPDIR/build.tmp
INSTALLER_TOOL=server_install.sh

cd $SRCDIR
if [ $? -ne 0 ]; then
	echo
	echo "ERROR: cannot find folder $SRCDIR"
	exit 1
fi

cd $WORKSPACE
echo
echo "=============================================="
echo "=============================================="
echo "Cleaning ..."
for DIR in $TEMPDIR; do
	if [ -d $DIR ]; then
		echo "Cleaning $DIR"
		rm -rf $DIR || exit 1
	fi
	mkdir $DIR || exit 1
done
echo "=============================================="
echo "=============================================="

cd $SRCDIR
echo
echo "=============================================="
echo "=============================================="
echo "NPM version:"
npm --version || exit 1
echo
echo "NodeJS version:"
node --version || exit 1
echo
echo "Package version:"
unset PACKVERS
PACKVERS=$(node -p "require('./package.json').version")
if [ -z "$PACKVERS" ]; then
	echo
	echo "ERROR: cannot retrieve package version"
	exit 1
fi
echo "package version is: $PACKVERS"
PACKPREF=Technologies
PACKNAME=${PACKPREF}_$PACKVERS.$BUILDNO.taz
DOCKERIMAGENAME=${PACKPREF}_$PACKVERS.$BUILDNO
[ ! -d $OUTDIR ] && (mkdir $OUTDIR || exit 1)
rm -f $OUTDIR/${PACKPREF}* 

echo "=============================================="
echo "=============================================="
echo "Check/Set configuration ...."
npm config list || exit 1
export npm_config_cache=$WORKSPACE/.npm

echo "=============================================="
echo "=============================================="
echo "Installing ...."
npm install --loglevel verbose --registry http://jnk-maven:8081/artifactory/api/npm/npm || exit 1


cd $WORKSPACE
echo "=============================================="
echo "=============================================="
echo "Packaging"
# get path of jenkins NodeJS installation = node exe + ../..
NODEDIR=`which node`
NODEDIR=`dirname $NODEDIR`
NODEDIR=`dirname $NODEDIR`
rsync -a $NODEDIR/ $TEMPDIR/NodeJS || exit 1
tar cvfz $SRCDIR/$PACKNAME -C $SRCDIR node_modules rest src package.json >$TMPFIC 2>&1
if [ $? -ne 0 ]; then
	cat $TMPFIC
	exit 1
fi

echo "=============================================="
echo "=============================================="
echo "Building docker image"
cd $SRCDIR
docker build --pull --rm -f "Dockerfile" -t technologies:$PACKVERS "." || exit 1

echo "=============================================="
echo "=============================================="
echo "Saving docker image"
docker save technologies:$PACKVERS | gzip >$OUTDIR/$DOCKERIMAGENAME.tar.gz 2>&1
if [ $? -ne 0 ]; then
	exit 1
fi

echo
echo "Docker Image path is: $OUTDIR/$PACKNAME"
echo "End of build with success."
exit 0
