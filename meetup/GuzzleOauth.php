<?php

use GuzzleOauth\BaseConsumerOauth2;

class GuzzleOauthMeetUp extends BaseConsumerOauth2 {

  public function __construct($baseUrl = '', $config = null)
  {
    parent::__construct($baseUrl, $config);
  }

  public static function factory($config = array())
  {
    // We don't need to normalize the token input here, that is only needed for the oauth 1 classes.
    $meetup_config = array(
      'service_description_path' => dirname(__FILE__) . '/GuzzleOauthMeetUp.json',
      'base_url' =>'https://api.meetup.com',
      'authorize_path' => 'oauth2/authorize',
      'access_token_path' => 'oauth2/access',
      'param_user_id' => 'id',
    );
    $config = $meetup_config + $config;
    return parent::factory($config);
  }

  public function getAuthorizeUrl($request_token, $callback_uri = NULL, $state = NULL) {

    // Change base url
    $old_base_url = $this->getBaseUrl();
    $base_url = 'https://secure.meetup.com/';
    $this->getConfig()->set('base_url', $base_url);
    $this->setBaseUrl($base_url);

    $return = parent::getAuthorizeUrl($request_token, $callback_uri, $state);

    // Revert base url
    $this->getConfig()->set('base_url', $old_base_url);
    $this->setBaseUrl($old_base_url);

    return $return;
  }

  public function getAccessToken($query_data, $request_token) {

    // Change base url
    $old_base_url = $this->getBaseUrl();
    $base_url = 'https://secure.meetup.com/';
    $this->getConfig()->set('base_url', $base_url);
    $this->setBaseUrl($base_url);

    $return = parent::getAccessToken($query_data, $request_token);

    // Revert base url
    $this->getConfig()->set('base_url', $old_base_url);
    $this->setBaseUrl($old_base_url);

    return $return;
  }

}
