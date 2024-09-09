import {
	IExecuteFunctions,
	IHttpRequestMethods,
} from 'n8n-workflow';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class VspcApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VSPC API',
		name: 'vspcApi',
		icon: 'file:vspc.svg',
		group: ['transform'],
		version: 1,
		description: 'Interacts with the Veeam Service Provider Console (VSPC) API',
		defaults: {
			name: 'VSPC API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'vspcApiCredentials-Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'options',
				options: [
					{
						name: 'Backup Jobs',
						value: 'backupJobs',
					},
					{
						name: 'Management Agents',
						value: 'managementAgents',
					},
					{
						name: 'VB365 Organization Jobs',
						value: 'vb365OrganizationJobs',
					},
				],
				default: 'backupJobs',
				description: 'Choose the VSPC API endpoint to interact with',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of results to return',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Offset for pagination',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				default: '',
				description: 'Sort criteria',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Filter criteria for the request',
			},
			{
				displayName: 'Ignore SSL Issues',
				name: 'ignoreSslIssues',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore SSL certificate validation issues',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('vspcApiCredentials-Api') as { baseUrl: string, token: string };

		const endpoint = this.getNodeParameter('endpoint', 0) as string;
		const limit = this.getNodeParameter('limit', 0) as number;
		const offset = this.getNodeParameter('offset', 0) as number;
		const sort = this.getNodeParameter('sort', 0) as string;
		const filter = this.getNodeParameter('filter', 0) as string;
		const ignoreSslIssues = this.getNodeParameter('ignoreSslIssues', 0) as boolean;

		let apiUrl = `${credentials.baseUrl.replace(/\/$/, '')}/api/v3/infrastructure`;

		if (endpoint === 'backupJobs') {
			apiUrl += `/backupServers/jobs`;
		} else if (endpoint === 'managementAgents') {
			apiUrl += `/managementAgents`;
		} else if (endpoint === 'vb365OrganizationJobs') {
			apiUrl += `/vb365Servers/organizations/jobs`;
		}

		const queryParams: { [key: string]: string | number } = {
			limit,
			offset,
		};
		if (sort) queryParams.sort = sort;
		if (filter) queryParams.filter = filter;

		const requestOptions = {
			method: 'GET' as IHttpRequestMethods,
			qs: queryParams,
			uri: apiUrl,
			headers: {
				Authorization: `Bearer ${credentials.token}`,
				'Content-Type': 'application/json',
			},
			json: true,
			agentOptions: {
				rejectUnauthorized: !ignoreSslIssues,
			},
		};

		try {
			const responseData = await this.helpers.requestWithAuthentication.call(this, 'vspcApiCredentials-Api', requestOptions);
			returnData.push({ json: responseData });
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `VSPC API request failed: ${error.message}`);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
