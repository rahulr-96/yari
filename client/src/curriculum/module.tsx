import useSWR from "swr";
import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, ModuleData } from "../../../libs/types/curriculum";
import { HTTPError, RenderDocumentBody } from "../document";
import { PLACEMENT_ENABLED, WRITER_MODE } from "../env";
import { TOC } from "../document/organisms/toc";
import { SidePlacement } from "../ui/organisms/placement";
import "./module.scss";
import { Sidebar } from "./sidebar";
import { TopNavigation } from "../ui/organisms/top-navigation";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { TopicIcon } from "./topic-icon";
import { topic2css, useDocTitle } from "./utils";
import { SidebarContainer } from "../document/organisms/sidebar";
import { PrevNext } from "./prev-next";

export function CurriculumModule(props: HydrationData<any, CurriculumDoc>) {
  const dataURL = `./index.json`;
  const { data } = useSWR<ModuleData>(
    dataURL,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new HTTPError(response.status, url, "Page not found");
        }

        const text = await response.text();
        throw new HTTPError(response.status, url, text);
      }

      return await response.json();
    },
    {
      fallbackData: props as ModuleData,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: !props.curriculumMeta,
    }
  );
  const { doc }: { doc?: CurriculumDoc } = data || props || {};
  useDocTitle(doc);

  return (
    <>
      {doc && (
        <>
          <div className="sticky-header-container">
            <TopNavigation />
            <ArticleActionsContainer doc={doc} />
          </div>
          <main
            className={`curriculum-content-container container topic-${topic2css(doc.topic)}`}
          >
            <div className="sidebar-container">
              <SidebarContainer doc={doc} label="Related Topics">
                {doc.sidebar && (
                  <Sidebar current={doc.mdn_url} sidebar={doc.sidebar} />
                )}
              </SidebarContainer>
              <div className="toc-container">
                <aside className="toc">
                  <nav>
                    {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}
                  </nav>
                </aside>
                {PLACEMENT_ENABLED && <SidePlacement />}
              </div>
              {doc.sidebar && (
                <Sidebar
                  extraClasses="sidebar"
                  current={doc.mdn_url}
                  sidebar={doc.sidebar}
                />
              )}
            </div>
            <article className="curriculum-content" lang={doc?.locale}>
              <header>
                {doc.topic && <TopicIcon topic={doc.topic} />}
                <h1>{doc?.title}</h1>
                {doc?.topic && <p>{doc.topic}</p>}
              </header>
              <RenderDocumentBody doc={doc} />
              <PrevNext doc={doc} />
            </article>
          </main>
        </>
      )}
    </>
  );
}