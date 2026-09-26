import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowUpRight, Bookmark, Layers3 } from "lucide-react";
import styles from "./AuthShell.module.css";

export default function AuthShell({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "login" | "register";
}) {
  const login = mode === "login";
  return (
    <div className={`${styles.shell} ${login ? styles.animated : ""}`}>
      <div className={styles.layout}>
        <aside className={styles.visual} aria-label="Cảm hứng không gian sống">
          <Image
            src="/images/product-space/organic-calm.png"
            alt="Không gian nội thất với chất liệu tự nhiên và sắc màu ấm áp"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 1px"
            className={styles.photo}
          />
          <div className={styles.shade} />
          <div className={styles.topline}>
            <span>DECOHO / LIVING INSPIRATION</span>
            <ArrowUpRight size={20} />
          </div>
          <div className={styles.story}>
            <span className={styles.eyebrow}>MỘT GÓC NHỎ. NGÀN CẢM HỨNG.</span>
            <p className={styles.headline}>
              {login ? (
                <>
                  Trở về với
                  <br />
                  điều bạn <em>yêu.</em>
                </>
              ) : (
                <>
                  Một khởi đầu.
                  <br />
                  Một tổ ấm <em>riêng.</em>
                </>
              )}
            </p>
            <p className={styles.description}>
              Lưu những ý tưởng bạn thích, tìm món đồ đúng gu và viết tiếp câu
              chuyện cho ngôi nhà của mình.
            </p>
            <div className={styles.note}>
              <span className={styles.noteIcon}>
                {login ? <Bookmark size={20} /> : <Layers3 size={20} />}
              </span>
              <div>
                <strong>
                  {login ? "Cảm hứng luôn ở đây" : "Không gian mang dấu ấn bạn"}
                </strong>
                <span>Moodboard · Nội thất · Cộng đồng</span>
              </div>
            </div>
          </div>
          <div className={styles.visualFooter}>
            <span>Thiết kế cho cách bạn sống.</span>
            <span>EST. DECOHO</span>
          </div>
        </aside>
        <section className={styles.formPanel}>
          <div className={styles.formContent}>{children}</div>
        </section>
      </div>
    </div>
  );
}
