import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ExplorerLink } from "./explorer-link";

const meta: Meta<typeof ExplorerLink> = {
  title: "DonationForm/ExplorerLink",
  component: ExplorerLink,
  render: (args) => <ExplorerLink {...args} />,
};

export default meta;

type Story = StoryObj<typeof ExplorerLink>;

export const Empty: Story = {
  args: {
    txHash: "",
  },
};

export const WithHash: Story = {
  args: {
    txHash: "0xDEADBEEF0123456789abcdef",
  },
  decorators: [(Story) => <div style={{ padding: '3em' }}><Story /></div>],
};
