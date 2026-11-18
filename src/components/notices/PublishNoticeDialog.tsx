"use client";

import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { toast } from "sonner";
import { Check, ExternalLink, Facebook, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FACEBOOK_CARD_SIZE, NoticeFacebookCard } from "@/components/notices/NoticeFacebookCard";
import { useNotice, usePublishNotice } from "@/hooks/useNotices";
import type { Notice } from "@/types/Notice";

const PREVIEW_SIZE = 360;

interface Props {
  notice: Notice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Notice is already on the website - only post it to Facebook. */
  facebookOnly?: boolean;
}

/**
 * Publish a notice on the website and, optionally, the Facebook Page as an
 * image post. The image is the NoticeFacebookCard below, captured in the
 * browser and uploaded with the publish request.
 */
export default function PublishNoticeDialog({ notice, open, onOpenChange, facebookOnly = false }: Props) {
  // Table rows don't carry the Facebook info (caption, configured) - the detail does.
  const { data, isLoading } = useNotice(open ? notice.id : undefined);
  const detail: Notice = data?.data ?? notice;
  const facebook = detail.facebook;
  const alreadyPosted = Boolean(facebook?.post_id);

  const publish = usePublishNotice();
  const cardRef = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState("");
  const [toFacebook, setToFacebook] = useState(true);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (facebook?.default_caption) setCaption(facebook.default_caption);
  }, [facebook?.default_caption]);

  const canPostToFacebook = Boolean(facebook?.configured) && !alreadyPosted;
  const willPostToFacebook = canPostToFacebook && (facebookOnly || toFacebook);

  const submit = async () => {
    const form = new FormData();
    if (willPostToFacebook) {
      if (!cardRef.current) return;
      setRendering(true);
      try {
        await document.fonts.ready;
        const blob = await toBlob(cardRef.current, {
          width: FACEBOOK_CARD_SIZE,
          height: FACEBOOK_CARD_SIZE,
          pixelRatio: 1,
          cacheBust: true,
        });
        if (!blob) throw new Error("Could not render the image");
        form.append("post_to_facebook", "1");
        form.append("facebook_image", blob, `notice-${notice.id}.png`);
        form.append("facebook_caption", caption);
      } catch (error: any) {
        toast.error(`Couldn't create the Facebook image: ${error?.message ?? error}`);
        return;
      } finally {
        setRendering(false);
      }
    }
    publish.mutate({ id: notice.id, form, facebookOnly }, { onSuccess: () => onOpenChange(false) });
  };

  const busy = rendering || publish.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{facebookOnly ? "Post to Facebook" : "Publish notice"}</DialogTitle>
          <DialogDescription>
            {facebookOnly
              ? "Posts this image and caption to the ExamsNepal Facebook Page."
              : "Publishes on examsnepal.com and, if ticked, posts this image to the Facebook Page."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
          {/* The card renders at full 1080px for capture; the wrapper scales it down for preview. */}
          <div
            className="overflow-hidden rounded-lg border bg-gray-50"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, maxWidth: "100%" }}
          >
            <div style={{ transform: `scale(${PREVIEW_SIZE / FACEBOOK_CARD_SIZE})`, transformOrigin: "top left" }}>
              <NoticeFacebookCard ref={cardRef} notice={detail} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            {!facebookOnly && (
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={willPostToFacebook}
                  disabled={!canPostToFacebook}
                  onCheckedChange={(checked) => setToFacebook(checked === true)}
                />
                <Facebook className="h-4 w-4 text-[#1877F2]" /> Also post to Facebook
              </label>
            )}

            {isLoading && <p className="text-sm text-muted-foreground">Loading Facebook settings…</p>}
            {facebook && !facebook.configured && (
              <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
                Facebook Page isn&apos;t connected - set NOTICES_FACEBOOK_PAGE_ID and NOTICES_FACEBOOK_PAGE_TOKEN on the backend. The notice
                will still publish on the website.
              </p>
            )}
            {alreadyPosted && facebook?.post_url && (
              <a href={facebook.post_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[#1877F2] hover:underline">
                <Check className="h-4 w-4" /> Already on Facebook <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {facebook?.error && !alreadyPosted && (
              <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">Last attempt failed: {facebook.error}</p>
            )}

            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Facebook caption</span>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={10}
                disabled={!willPostToFacebook}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={busy || (facebookOnly && !willPostToFacebook)}
            onClick={submit}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {facebookOnly ? "Post to Facebook" : willPostToFacebook ? "Publish & post to Facebook" : "Publish on website"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
