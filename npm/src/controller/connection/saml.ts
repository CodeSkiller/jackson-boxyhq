import crypto from 'crypto';
import {
  IConnectionAPIController,
  SAMLSSOConnectionWithEncodedMetadata,
  SAMLSSOConnectionWithRawMetadata,
  SAMLSSORecord,
  Storable,
} from '../../typings';
import * as dbutils from '../../db/utils';
import {
  extractHostName,
  extractRedirectUrls,
  IndexNames,
  validateSSOConnection,
  validateRedirectUrl,
} from '../utils';
import saml20 from '@boxyhq/saml20';
import x509 from '../../saml/x509';
import { JacksonError } from '../error';

const saml = {
  create: async (
    body: SAMLSSOConnectionWithRawMetadata | SAMLSSOConnectionWithEncodedMetadata,
    connectionStore: Storable
  ) => {
    const {
      encodedRawMetadata,
      rawMetadata,
      defaultRedirectUrl,
      redirectUrl,
      tenant,
      product,
      name,
      description,
    } = body;
    const forceAuthn = body.forceAuthn == 'true' || body.forceAuthn == true;

    let connectionClientSecret: string;

    validateSSOConnection(body, 'saml');

    const redirectUrlList = extractRedirectUrls(redirectUrl);

    validateRedirectUrl({ defaultRedirectUrl, redirectUrlList });

    const record: Partial<SAMLSSORecord> = {
      defaultRedirectUrl,
      redirectUrl: redirectUrlList,
      tenant,
      product,
      name,
      description,
      clientID: '',
      clientSecret: '',
      forceAuthn,
    };

    let metaData = rawMetadata as string;
    if (encodedRawMetadata) {
      metaData = Buffer.from(encodedRawMetadata, 'base64').toString();
    }

    const idpMetadata = (await saml20.parseMetadata(metaData, {})) as SAMLSSORecord['idpMetadata'];

    if (!idpMetadata.entityID) {
      throw new JacksonError("Couldn't parse EntityID from SAML metadata", 400);
    }

    // extract provider
    let providerName = extractHostName(idpMetadata.entityID);
    if (!providerName) {
      providerName = extractHostName(idpMetadata.sso.redirectUrl || idpMetadata.sso.postUrl || '');
    }

    idpMetadata.provider = providerName ? providerName : 'Unknown';

    record.clientID = dbutils.keyDigest(dbutils.keyFromParts(tenant, product, idpMetadata.entityID));

    const certs = await x509.generate();

    if (!certs) {
      throw new JacksonError('Error generating x509 certs');
    }

    record.idpMetadata = idpMetadata;
    record.certs = certs;

    const exists = await connectionStore.get(record.clientID);

    if (exists) {
      connectionClientSecret = exists.clientSecret;
    } else {
      connectionClientSecret = crypto.randomBytes(24).toString('hex');
    }

    record.clientSecret = connectionClientSecret;

    await connectionStore.put(
      record.clientID,
      record,
      {
        name: IndexNames.EntityID, // secondary index on entityID
        value: idpMetadata.entityID,
      },
      {
        // secondary index on tenant + product
        name: IndexNames.TenantProduct,
        value: dbutils.keyFromParts(tenant, product),
      }
    );

    return record as SAMLSSORecord;
  },

  update: async (
    body: (SAMLSSOConnectionWithRawMetadata | SAMLSSOConnectionWithEncodedMetadata) & {
      clientID: string;
      clientSecret: string;
    },
    connectionStore: Storable,
    connectionsGetter: IConnectionAPIController['getConnections']
  ) => {
    const {
      encodedRawMetadata, // could be empty
      rawMetadata, // could be empty
      defaultRedirectUrl,
      redirectUrl,
      name,
      description,
      forceAuthn = false,
      ...clientInfo
    } = body;

    if (!clientInfo?.clientID) {
      throw new JacksonError('Please provide clientID', 400);
    }

    if (!clientInfo?.clientSecret) {
      throw new JacksonError('Please provide clientSecret', 400);
    }

    if (!clientInfo?.tenant) {
      throw new JacksonError('Please provide tenant', 400);
    }

    if (!clientInfo?.product) {
      throw new JacksonError('Please provide product', 400);
    }

    if (description && description.length > 100) {
      throw new JacksonError('Description should not exceed 100 characters', 400);
    }

    const redirectUrlList = redirectUrl ? extractRedirectUrls(redirectUrl) : null;
    validateRedirectUrl({ defaultRedirectUrl, redirectUrlList });

    const _savedConnection = (await connectionsGetter(clientInfo))[0] as SAMLSSORecord;

    if (_savedConnection.clientSecret !== clientInfo?.clientSecret) {
      throw new JacksonError('clientSecret mismatch', 400);
    }

    let metaData = rawMetadata;
    if (encodedRawMetadata) {
      metaData = Buffer.from(encodedRawMetadata, 'base64').toString();
    }

    let newMetadata;
    if (metaData) {
      newMetadata = await saml20.parseMetadata(metaData, {});

      if (!newMetadata.entityID) {
        throw new JacksonError("Couldn't parse EntityID from SAML metadata", 400);
      }
      // extract provider
      let providerName = extractHostName(newMetadata.entityID);
      if (!providerName) {
        providerName = extractHostName(newMetadata.sso.redirectUrl || newMetadata.sso.postUrl);
      }

      newMetadata.provider = providerName ? providerName : 'Unknown';
    }

    if (newMetadata) {
      // check if clientID matches with new metadata payload
      const clientID = dbutils.keyDigest(
        dbutils.keyFromParts(clientInfo.tenant, clientInfo.product, newMetadata.entityID)
      );

      if (clientID !== clientInfo?.clientID) {
        throw new JacksonError('Tenant/Product config mismatch with IdP metadata', 400);
      }
    }

    const record = {
      ..._savedConnection,
      name: name ? name : _savedConnection.name,
      description: description ? description : _savedConnection.description,
      idpMetadata: newMetadata ? newMetadata : _savedConnection.idpMetadata,
      defaultRedirectUrl: defaultRedirectUrl ? defaultRedirectUrl : _savedConnection.defaultRedirectUrl,
      redirectUrl: redirectUrlList ? redirectUrlList : _savedConnection.redirectUrl,
      forceAuthn,
    };

    await connectionStore.put(
      clientInfo?.clientID,
      record,
      {
        // secondary index on entityID
        name: IndexNames.EntityID,
        value: _savedConnection.idpMetadata.entityID,
      },
      {
        // secondary index on tenant + product
        name: IndexNames.TenantProduct,
        value: dbutils.keyFromParts(_savedConnection.tenant, _savedConnection.product),
      }
    );
  },
};

export default saml;
