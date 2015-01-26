Guzzle-oAuth-Meetup
===================

Example code to use Guzzle oAuth with another provider then one of the big four (linkedin, google, facebook, twitter).

See: http://github.com/VDMi/Guzzle-oAuth

```php
// To use the meetup provider, be sure that Guzzle oAuth is in your autoloader
// This example just includes.. would be better if it was autoloaded.
include 'GuzzleOauthMeetUp.php';
$config = array(
  // see Guzzle oAuth
);
$client = \GuzzleOauthMeetUp::factory($config);
```
