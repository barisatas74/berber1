#!/usr/bin/env bash
ROOT="C:/Users/duygu/Documents/proje 1"
PERL="/usr/bin/perl"

echo "Listening on http://localhost:$PORT"

exec "$PERL" - "$PORT" "$ROOT" <<'PERLSCRIPT'
use strict; use warnings; use IO::Socket::INET;
my ($port, $root) = @ARGV;
$root //= '.';
my %mime = (html=>'text/html; charset=utf-8',css=>'text/css',js=>'application/javascript',json=>'application/json',png=>'image/png',jpg=>'image/jpeg',ico=>'image/x-icon',svg=>'image/svg+xml');
my $srv = IO::Socket::INET->new(LocalPort=>$port,Type=>SOCK_STREAM,Reuse=>1,Listen=>20) or die "Cannot bind $port: $!\n";
while(my $c=$srv->accept()){
  my $req=''; while(my $l=<$c>){$req.=$l;last if $l=~/^\r?\n$/}
  my(undef,$path)=$req=~/^(\w+)\s+(\S+)/;
  $path//='/'; $path='/index.html' if $path eq '/'; $path=~s/\?.*//; $path=~s|^/||;
  my $f="$root/$path";
  if(-f $f){
    my($ext)=$f=~/\.(\w+)$/; my $ct=$mime{lc($ext//'')}//'application/octet-stream';
    open(my $fh,'<:raw',$f) or do{print $c "HTTP/1.1 403 Forbidden\r\n\r\n";close $c;next};
    local $/; my $d=<$fh>; close $fh;
    printf $c "HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %d\r\nConnection: close\r\n\r\n",$ct,length($d);
    print $c $d;
  } else {
    print $c "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404: $path\n";
  }
  close $c;
}
PERLSCRIPT
