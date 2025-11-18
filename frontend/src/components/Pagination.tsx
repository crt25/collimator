import { ButtonGroup, IconButton, Pagination, chakra } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useIntl, defineMessages } from "react-intl";

interface DataTablePaginationProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (pageIndex: number) => void;
}

const PaginationWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "sm",
  },
});

const PageButton = chakra(IconButton, {
  base: {
    borderRadius: "sm",
    _hover: {
      backgroundColor: "gray.300",
    },
  },
  variants: {
    state: {
      inactive: {
        backgroundColor: "gray.200",
        color: "black",
        _hover: {
          backgroundColor: "black",
          color: "white",
        },
      },
      active: {
        backgroundColor: "black",
        color: "white",
        _hover: {
          backgroundColor: "gray.600",
        },
      },
    },
  },
  defaultVariants: {
    state: "inactive",
  },
});

const NavigationButton = chakra(IconButton, {
  base: {
    backgroundColor: "transparent",
    color: "gray.600",
    _hover: {
      color: "black",
      backgroundColor: "transparent",
    },
  },
});

const messages = defineMessages({
  paginationPrevious: {
    id: "datatable.pagination.previous",
    defaultMessage: "Previous",
  },
  paginationNext: {
    id: "datatable.pagination.next",
    defaultMessage: "Next",
  },
});

export const DataTablePagination = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPageChange,
}: DataTablePaginationProps) => {
  const intl = useIntl();

  const currentPage = pageIndex + 1;

  return (
    <PaginationWrapper>
      <Pagination.Root
        count={pageCount}
        pageSize={1}
        defaultPage={currentPage}
        page={currentPage}
        onPageChange={(e) => onPageChange(e.page - 1)}
      >
        <ButtonGroup>
          <Pagination.PrevTrigger asChild>
            <NavigationButton
              aria-label={intl.formatMessage(messages.paginationPrevious)}
              disabled={!canPreviousPage}
            >
              <LuChevronLeft />
            </NavigationButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => {
              const isCurrentPage = page.value === currentPage;
              return (
                <PageButton state={isCurrentPage ? "active" : "inactive"}>
                  {page.value}
                </PageButton>
              );
            }}
          />

          <Pagination.NextTrigger asChild>
            <NavigationButton
              aria-label={intl.formatMessage(messages.paginationNext)}
              disabled={!canNextPage}
            >
              <LuChevronRight />
            </NavigationButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </PaginationWrapper>
  );
};

export default DataTablePagination;
