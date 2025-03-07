# SAML Jackson

<p>
    <a href="https://www.npmjs.com/package/@boxyhq/saml-jackson"><img src="https://img.shields.io/npm/dt/@boxyhq/saml-jackson" alt="npm" ></a>
    <a href="https://hub.docker.com/r/boxyhq/jackson"><img src="https://img.shields.io/docker/pulls/boxyhq/jackson" alt="Docker pull"></a>
    <a href="https://github.com/boxyhq/jackson/stargazers"><img src="https://img.shields.io/github/stars/boxyhq/jackson" alt="Github stargazers"></a>
    <a href="https://github.com/boxyhq/jackson/issues"><img src="https://img.shields.io/github/issues/boxyhq/jackson" alt="Github issues"></a>
    <a href="https://github.com/boxyhq/jackson/blob/main/LICENSE"><img src="https://img.shields.io/github/license/boxyhq/jackson" alt="license"></a>
    <a href="https://twitter.com/BoxyHQ"><img src="https://img.shields.io/twitter/follow/BoxyHQ?style=social" alt="Twitter"></a>
    <a href="https://discord.gg/uyb7pYt4Pa"><img src="https://img.shields.io/discord/877585485235630130" alt="Discord"></a>
    <a href="https://www.npmjs.com/package/@boxyhq/saml-jackson"><img src="https://img.shields.io/node/v/@boxyhq/saml-jackson" alt="node-current"></a>
    <a href="https://raw.githubusercontent.com/boxyhq/jackson/main/swagger/swagger.json"><img src="https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fboxyhq%2Fjackson%2Fmain%2Fswagger%2Fswagger.json" alt="Swagger Validator"></a>
</p>

[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fboxyhq%2Fjackson&env=DB_ENGINE,DB_TYPE,DB_URL,DB_ENCRYPTION_KEY,DB_TTL,DB_CLEANUP_LIMIT,JACKSON_API_KEYS,EXTERNAL_URL,IDP_ENABLED,SAML_AUDIENCE,CLIENT_SECRET_VERIFIER,SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,NEXTAUTH_URL,NEXTAUTH_SECRET,NEXTAUTH_ACL&envDescription=DB%20configuration%20and%20keys%20for%20encryption%20and%20authentication.EXTERNAL_URL%20(Usually%20https%3A%2F%2F%3Cproject-name-from-above%3E.vercel.app)%20can%20be%20set%20after%20deployment%20from%20the%20project%20dashboard.Set%20to%20''%20if%20not%20applicable.&envLink=https://boxyhq.com/docs/jackson/deploy/env-variables>)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

SAML SSO service

Jackson implements the SAML login flow as an OAuth 2.0 or OpenID Connect flow, abstracting away all the complexities of the SAML protocol. Integrate SAML with just a few lines of code. We also now support OpenID Connect providers.

Try our hosted demo showcasing the SAML SP login flow [here](https://saml-demo.boxyhq.com), no SAML configuration required thanks to our [Mock SAML](https://mocksaml.com) service.

You can also try our hosted demo showcasing the SAML IdP login flow [here](https://mocksaml.com/saml/login).

## Documentation

For full documentation, visit [boxyhq.com/docs/jackson/overview](https://boxyhq.com/docs/jackson/overview)

## Directory Sync

SAML Jackson also includes support for Directory Sync based on the SCIM 2.0 protocol.

Directory sync helps organizations automate the provisioning and de-provisioning of their users. As a result, it streamlines the user lifecycle management process by saving valuable organizational hours, creating a single truth source of the user identity data, and facilitating them to keep the data secure.

For full documentation, visit [boxyhq.com/docs/directory-sync/overview](https://boxyhq.com/docs/directory-sync/overview)

## Source code visualizer

[CodeSee codebase visualizer](https://app.codesee.io/maps/public/53e91640-23b5-11ec-a724-79d7dd589517)

## Observability

We support first-class observability on the back of OpenTelemetry, refer [here](https://boxyhq.com/docs/jackson/observability) for more details.

## SBOM Reports (Software Bill Of Materials)

We support SBOM reports, refer [here](https://boxyhq.com/docs/jackson/sbom) for more details.

## Container Signing and Verification

We support container image verification using cosign, refer [here](https://boxyhq.com/docs/jackson/container-signing) for more details.

## Contributing

Thanks for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make will benefit everybody else and are appreciated.

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

## Support

Reach out to the maintainers at one of the following places:

- [GitHub Discussions](https://github.com/boxyhq/jackson/discussions)
- [GitHub Issues](https://github.com/boxyhq/jackson/issues)

## Reporting Security Issues

[Responsible Disclosure](SECURITY.md)

## License

[Apache 2.0 License](https://github.com/boxyhq/jackson/blob/main/LICENSE)
