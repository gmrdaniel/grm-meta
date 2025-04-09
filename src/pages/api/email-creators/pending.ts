
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sourceFile } = req.query;

    if (!sourceFile || typeof sourceFile !== "string") {
      return res.status(400).json({ error: "Source file parameter is required" });
    }

    // Fetch pending creators (prompt_output is null) for the specified source file
    const { data, error } = await supabase
      .from("email_creators")
      .select("*")
      .eq("source_file", sourceFile)
      .is("prompt_output", null);

    if (error) {
      console.error("Error fetching pending creators:", error);
      return res.status(500).json({ error: "Failed to fetch pending creators" });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Error in pending creators API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
