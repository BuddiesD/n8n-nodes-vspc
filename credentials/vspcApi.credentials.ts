import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class vspcApi implements ICredentialType {
	name = 'vspcApiCredentials-Api';
	displayName = 'VSPC API';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-vspc-api-url.com:1280',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'token',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
		},
	];
}
