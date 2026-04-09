#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket::INET;
use File::Basename;
use POSIX qw(WNOHANG);

my $port = $ENV{PORT} || 3000;
my $root = "C:/Users/duygu/Documents/proje 1";

my %mime = (
    html => 'text/html; charset=utf-8',
    css  => 'text/css',
    js   => 'application/javascript',
    json => 'application/json',
    png  => 'image/png',
    jpg  => 'image/jpeg',
    ico  => 'image/x-icon',
    svg  => 'image/svg+xml',
);

my $server = IO::Socket::INET->new(
    LocalPort => $port,
    Type      => SOCK_STREAM,
    Reuse     => 1,
    Listen    => 10,
) or die "Cannot bind port $port: $!\n";

print "Listening on http://localhost:$port\n";
$| = 1;

while (my $client = $server->accept()) {
    my $request = '';
    while (my $line = <$client>) {
        $request .= $line;
        last if $line =~ /^\r?\n$/;
    }

    my ($method, $path) = $request =~ /^(\w+)\s+(\S+)/;
    $path = '/index.html' if !$path || $path eq '/';
    $path =~ s/\?.*//;
    $path =~ s|^/||;

    my $file = "$root/$path";

    if (-f $file) {
        my ($ext) = $file =~ /\.(\w+)$/;
        my $ct = $mime{lc($ext) // ''} || 'application/octet-stream';
        open(my $fh, '<:raw', $file) or do {
            print $client "HTTP/1.1 403 Forbidden\r\n\r\n";
            close $client; next;
        };
        local $/;
        my $data = <$fh>;
        close $fh;
        my $len = length($data);
        print $client "HTTP/1.1 200 OK\r\nContent-Type: $ct\r\nContent-Length: $len\r\nConnection: close\r\n\r\n$data";
    } else {
        print $client "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot Found: $path\n";
    }
    close $client;
}
