# VSPC API - n8n Custom Node

This is a custom n8n node for interacting with the **Veeam Service Provider Console (VSPC)** API. It allows you to fetch data from various endpoints in the VSPC API, such as backup jobs, management agents, triggered alarms, and tenant products.

## Features

- **Fetch Backup Jobs**: Retrieve a list of all backup jobs from VSPC.
- **Fetch Management Agents**: Retrieve a list of management agents from VSPC.
- **Fetch VB365 Organization Jobs**: Retrieve a list of all organization jobs from VB365 servers.
- **Fetch Company Information**: Retrieve detailed information about specific companies using their `companyUid`.
- **Fetch Products of all Tenants**: Retrieve all products of tenants, their versions, and more.
- **Fetch Active Alarms**: Retrieve a list of all currently active alarms from VSPC.

## Installation

To install this custom node in your n8n instance:

1. Clone this repository:
   ```bash
   git clone https://github.com/BuddiesD/n8n-nodes-vspc.git

Navigate to the project directory:
cd n8n-nodes-vspc
Build the node:
		```bash
		pnpm build
		```

Add it to your n8n instance. Refer to the n8n documentation for detailed instructions.

Usage
Once installed, you can use the VSPC API node in your workflows. The node supports the following endpoints:

Authentication
The node uses API Token-based authentication. You need to provide valid VSPC API credentials to connect to the VSPC instance. Ensure you have the correct base URL and API token from your VSPC console.

License
This project is licensed under the MIT License. See the LICENSE file for details.
