import { CampaignBuilder } from "@/components/studio/CampaignBuilder";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignBuilder campaignId={campaignId} />;
}
